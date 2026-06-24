from app.database import client

try:
    client.admin.command("ping")
    print("MongoDB connected successfully!")
except Exception as error:
    print("MongoDB connection failed:")
    print(error)