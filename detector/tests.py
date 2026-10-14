from django.test import TestCase


class DetectorPageTests(TestCase):
    def test_home_page_has_model_and_both_input_controls(self):
        response = self.client.get("/")

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'id="model-url"')
        self.assertContains(response, 'id="start-camera"')
        self.assertContains(response, 'id="image-upload"')
