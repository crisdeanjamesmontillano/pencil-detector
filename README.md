# Money Detector

A Django web app that identifies the money-value labels in your Teachable Machine image model using either a webcam or an uploaded image.

## Run locally

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py runserver
```

Open `http://127.0.0.1:8000/`, load your exported Teachable Machine image model, then choose the camera or upload option.
