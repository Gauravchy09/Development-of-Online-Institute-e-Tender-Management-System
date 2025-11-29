from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models, schemas
from .database import engine
from .routers import auth, department, tenders, tender_category, bids, awards

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# 👇 Add this section
origins = [
    "http://localhost:5173",  # Your React app's address
    "http://localhost:3000",  # A common alternative for React dev
    # You would add your deployed frontend's URL here for production
    # "https://your-app-name.vercel.app",
    "https://development-of-online-institute-e-t-seven.vercel.app",
    "https://792hpzm4-8000.inc1.devtunnels.ms"
]

# 👇 3. Add the CORSMiddleware to your application
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Allows specific origins
    allow_credentials=True,      # Allows cookies to be included in requests
    allow_methods=["*"],         # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],         # Allows all headers
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Tendering API"}

app.include_router(auth.router)
app.include_router(department.router)
app.include_router(tenders.router)
app.include_router(tender_category.router)
app.include_router(bids.router)
app.include_router(awards.router)