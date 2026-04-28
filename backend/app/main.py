from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine
from .routers import livros, categorias, autores, leitores, emprestimos

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LibLivre API",
    description="API para o sistema de gerenciamento de bibliotecas",
    version="1.0.0"
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(livros.router)
app.include_router(categorias.router)
app.include_router(autores.router)
app.include_router(leitores.router)
app.include_router(emprestimos.router)

@app.get("/")
def read_root():
    return {"status": "A API do LibLivre está rodando perfeitamente!"}