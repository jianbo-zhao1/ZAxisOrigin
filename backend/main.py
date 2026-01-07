from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from build123d import *
import os
import tempfile

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/generate-demo")
def generate_demo(length: float = 100, width: float = 50):
    print(f"Request received: length={length}, width={width}")
    
    try:
        with BuildPart() as p:
            Box(length, width, 10)
            Cylinder(radius=10, height=20, mode=Mode.SUBTRACT)
        
        with tempfile.NamedTemporaryFile(suffix=".stl", delete=False) as tmp:
            tmp_path = tmp.name
        
        export_stl(p.part, tmp_path)
        
        with open(tmp_path, "rb") as f:
            stl_data = f.read()
            
        os.unlink(tmp_path)
        
        print("Done Generating...")
        return Response(content=stl_data, media_type="model/stl")

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response(content=str(e), status_code=500)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)