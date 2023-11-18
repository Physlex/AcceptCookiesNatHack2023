# STL
from pathlib import Path

# EXTERNAL
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

import uvicorn
import mongoengine

# INTERNAL
from museboard import MuseBoard
from models import User, Data
from csv_to_json import make_json

## GLOBAL SERVER STATE
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


## RENDER

def serve_html(file_path: Path) -> HTMLResponse:
    if not file_path.is_file():
        return HTMLResponse(content="File not found", status_code=404)

    with open(file_path, "r", encoding="utf-8") as file:
        content = file.read()
        return HTMLResponse(content=content)


## GET


@app.get("/", response_class=HTMLResponse)
async def index():
    file_path = Path("templates/index.html")
    return serve_html(file_path)

# Define a route to render HTML files
@app.get("/{filename}", response_class=HTMLResponse)
async def read_html(filename: str):
    file_path = Path(f"templates/{filename}.html")
    return serve_html(file_path)


## POST


@app.post("/connect_brainflow")
async def connect(id: int = 5):
    muse_board = MuseBoard(serial_port_num=id)
    muse_board.connect_to_session()

@app.post("/remove_connection")
async def remove(id: int = 5):
    muse_board = MuseBoard(serial_port_num=id)
    muse_board.release_session()

@app.post("/poll_data")
async def poll(id: int = 5):
    board = MuseBoard(serial_port_num=id)
    eeg_channels = board.get_eeg_channel_id()
    timestamp_channel = board.get_time_channel_id()
    brainflow_data = board.get_session_data()
    user = User.objects().first()
    data = Data(
        timestamps=brainflow_data["board_data_buff"][timestamp_channel],
        data=[brainflow_data["board_data_buff"][i] for i in eeg_channels],
        channels=eeg_channels,
        device_used="muse2",
    )
    data = user.data.append(data)
    user.update(set__data=data)

    # TODO: Apply preprocessing
    # TODO: FOR EACH filter in Filters:
    #           Apply filter to eeg_channel_data

    content = {
        "timestamp_channel": timestamp_channel,
        "eeg_channels": eeg_channels,
        "brainflow_data": brainflow_data,
    }

    return JSONResponse(content=content)

# python app reads EEG data
# python stores it as json file (or converts)
# fastapi sends data to webpage to be displayed on a chart
# NO IDEA IF THIS WORKS
@app.post("/eeg_data")
async def send_eeg_data():
    # DAMN!
    # defining file paths, creating json file
    json_file = open("EEGdata.json", x)
    json_path = Path(f"EEGdata.json")
    csv_path = Path(f"test.csv")
    # converting eeg data to json
    make_json(csv_path, json_path)
    # send to webpage
    return json_file
    

# TODO: POST Send filter state update for server state

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
    pass

