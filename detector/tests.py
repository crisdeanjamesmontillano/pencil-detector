from django.test import TestCase


class DetectorPageTests(TestCase):
    def test_home_page_has_model_folder_and_both_input_controls(self):
        response = self.client.get("/")

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'id="model-folder"')
        self.assertContains(response, "webkitdirectory")
        self.assertContains(response, 'id="start-camera"')
        self.assertContains(response, 'id="image-upload"')

    def test_home_page_loads_detector_assets_and_prediction_regions(self):
        response = self.client.get("/")

        self.assertContains(response, "detector/css/app.css")
        self.assertContains(response, "detector/js/detector.js")
        self.assertContains(response, 'id="prediction-label"')
        self.assertContains(response, 'id="prediction-confidence"')
