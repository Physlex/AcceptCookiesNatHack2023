from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path

app = FastAPI()

# Mount the 'templates' folder to serve HTML files
app.mount("/templates", StaticFiles(directory="templates"), name="templates")

# Define a route to render HTML files
@app.get("/{filename}", response_class=HTMLResponse)
async def read_html(filename: str):
    file_path = Path(f"templates/{filename}.html")
    
    if not file_path.is_file():
        return HTMLResponse(content="File not found", status_code=404)
    
    with open(file_path, "r", encoding="utf-8") as file:
        content = file.read()
        return HTMLResponse(content=content)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
