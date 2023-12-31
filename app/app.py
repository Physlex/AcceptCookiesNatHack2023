# STL
from pathlib import Path
import csv

# EXTERNAL
from fastapi import FastAPI
from fastapi.encoders import jsonable_encoder
from fastapi.responses import HTMLResponse
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

import uvicorn
import mongoengine

# INTERNAL
from src.channel.museboard import MuseBoard
from src.channel.filters import last_state, ICAFilter, WavelettFilter, FourierFilter
from models import User, Data


## GLOBAL SERVER STATE
app = FastAPI()
mongoengine.connect("NatHacks")
board = MuseBoard()
has_connected = False
is_test_mode = True
origins = ["http://127.0.0.1:8000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


## MOUNT

app.mount("/templates", StaticFiles(directory="templates"), name="templates")
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
    board.set_serial_port_num(id)
    board.connect_to_session()
    has_connected = True


@app.post("/remove_connection")
async def remove(id: int = 5):
    if (has_connected == True):
        board.release_session()
        has_connected = False


@app.post("/poll")
async def poll():
    eeg_channels = [[], [], [], []]
    timestamp_channel = []
    if (has_connected == True):
        # Connect to museboard
        eeg_channel_ids = board.get_eeg_channel_id()
        timestamp_channel_id = board.get_time_channel_id()
        board_channels = board.get_session_data()

        # package channel data
        for channel_id in eeg_channel_ids:
            eeg_channels[channel_id - 1] = board_channels[channel_id]
        timestamp_channel = board_channels[timestamp_channel_id]

        # Database transactions
        user = User.objects().first()
        data = Data(
            timestamps=timestamp_channel,
            data=board_channels,
            channels=eeg_channel_ids,
            device_used="muse2",
        )
        user_data = user.data
        user_data.append(data)
        user.update(set__data=user_data)
    elif(has_connected == False and is_test_mode == True):
        data = []
        with open("./src/channel/data/test.csv", "r") as csv_file:
            csv_iter = csv.reader(csv_file, delimiter=',')
            for row in csv_iter:
                if len(row) > 0:
                    data.append(row)

        for i in range(1, len(data)):
            row = list(data[i])
            for j in range(1, len(row)):
                eeg_channels[j - 1].append(row[j])

            time = row[0]
            timestamp_channel.append(time)

    # Create package response object
    eeg_package = {"timestamp_channel":timestamp_channel, "eeg_channels":eeg_channels}
    encoded_package = jsonable_encoder(eeg_package)
    return JSONResponse(content=encoded_package)

@app.post("/filter_state")
async def filter_state_update(filter: str = ""):
    if filter == "ICA":
        state_filter = ICAFilter()
    elif filter == "FOURIER":
        state_filter = FourierFilter()
    elif filter == "WAVELETT":
        state_filter = WavelettFilter()
    response = {"new_state": state_filter.apply(eeg_channels=last_state)}
    return JSONResponse(content=response)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
