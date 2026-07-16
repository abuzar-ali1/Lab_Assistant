from urllib.parse import parse_qs, urlparse

from django.contrib.auth import get_user_model
from django.core import mail
from django.test import TestCase, override_settings
from django.urls import reverse


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    FRONTEND_URL='http://localhost:3000',
)
class PasswordResetFlowTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email='patient@example.com',
            username='patient',
            password='OldPassword1',
        )

    def test_reset_link_changes_password_once(self):
        response = self.client.post(
            reverse('forgot_password'),
            {'email': self.user.email},
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)

        reset_url = next(
            line for line in mail.outbox[0].body.splitlines()
            if line.startswith('http://localhost:3000/reset-password')
        )
        params = parse_qs(urlparse(reset_url).query)
        payload = {
            'uid': params['uid'][0],
            'token': params['token'][0],
            'new_password': 'NewPassword2',
            'new_password_confirm': 'NewPassword2',
        }

        reset_response = self.client.post(
            reverse('reset_password'),
            payload,
            content_type='application/json',
        )
        self.assertEqual(reset_response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPassword2'))

        reused_response = self.client.post(
            reverse('reset_password'),
            payload,
            content_type='application/json',
        )
        self.assertEqual(reused_response.status_code, 400)

    def test_unknown_email_does_not_reveal_account_status(self):
        response = self.client.post(
            reverse('forgot_password'),
            {'email': 'missing@example.com'},
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 0)
