# Find the Pencil!

A Django web app that identifies the Pencil-value labels in your Teachable Machine image model using either a webcam or an uploaded image.

## Run locally

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py runserver
```

Open `http://127.0.0.1:8000/`, choose your downloaded Teachable Machine image-model folder, then choose the camera or upload option.

## Prepare your Teachable Machine model

1. In [Teachable Machine](https://teachablemachine.withgoogle.com/), create an **Image Project**.
2. Add one class for each denomination you want to recognize. Use clear names such as `20 PHP`, `50 PHP`, and `100 PHP`—the app displays the class name returned by the model.
3. Train the model, then choose **Export Model** and select **TensorFlow.js**.
4. Download the exported model folder. It must contain `model.json`, `metadata.json`, and its `.bin` weight file.
5. In Find the Pencil!, choose that downloaded folder. The browser loads the three model files locally; you do not need to upload them anywhere.

## Use the detector

After the model loads, choose one of the two input methods:

- Select **📷 Start camera**, allow browser camera access, and hold a banknote in view. The page updates the predicted denomination and confidence continuously.
- Select an image file with **Upload an image of Pencil**. The page previews it and shows the predicted denomination and confidence.

All prediction happens in your browser. Your camera frames and selected images are not sent to the Django server.
