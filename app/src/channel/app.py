from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pathlib import Path
from connect_muse import connect_brainflow
import uvicorn
from models import User,Data
import mongoengine

app = FastAPI()
mongoengine.connect("NatHacks")

origins = ["localhost"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the 'templates' folder to serve HTML files
app.mount("/templates", StaticFiles(directory="templates"), name="templates")

# Mount the 'static' folder to serve static files (including JavaScript)
app.mount("/static/js", StaticFiles(directory="static/js"), name="static/js")
app.mount("/static/css", StaticFiles(directory="static/css"), name="static/css")


def serve_html(file_path: Path) -> HTMLResponse:
    if not file_path.is_file():
        return HTMLResponse(content="File not found", status_code=404)

    with open(file_path, "r", encoding="utf-8") as file:
        content = file.read()
        return HTMLResponse(content=content)


@app.get("/", response_class=HTMLResponse)
async def index():
    file_path = Path("templates/index.html")
    return serve_html(file_path)


# Define a route to render HTML files
@app.get("/{filename}", response_class=HTMLResponse)
async def read_html(filename: str):
    file_path = Path(f"templates/{filename}.html")
    return serve_html(file_path)


@app.post("/connect_brainflow")
async def connect(id:int = 5):
    brainflow_data = connect_brainflow(id)
    eeg_channels = brainflow_data["board_egg_chann"]
    timestamp_channel = brainflow_data["board_time_chann"]
    user = User.objects().first()
    data = Data(
        timestamps = brainflow_data["board_data_buff"][timestamp_channel],
        data = [brainflow_data["board_data_buff"][i] for i in eeg_channels],
        channels = eeg_channels,
        device_used = "muse2"
    )
    data = user.data.append(data)
    user.update(
        set__data = data
    )
    return JSONResponse(content={"Succes":"True!"})
    


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
