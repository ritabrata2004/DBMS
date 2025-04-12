from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import random
import string
import logging

# Set up logger
logger = logging.getLogger(__name__)

# Create your models here.
class PasswordResetOTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    def __str__(self):
        return f"OTP for {self.user.username}"
    
    def is_valid(self):
        """Check if the OTP is still valid"""
        return not self.is_used and self.expires_at > timezone.now()
    
    @classmethod
    def generate_otp(cls, user, expiry_minutes=10):
        """Generate a new OTP for the given user"""
        try:
            logger.info(f"Invalidating previous OTPs for user {user.username}")
            # Invalidate any existing OTPs
            cls.objects.filter(user=user, is_used=False).update(is_used=True)
            
            # Generate a 6-digit OTP
            otp = ''.join(random.choices(string.digits, k=6))
            logger.info(f"Generated new OTP for user {user.username}")
            
            # Set expiry time
            expires_at = timezone.now() + timezone.timedelta(minutes=expiry_minutes)
            
            # Create and return the OTP
            otp_obj = cls.objects.create(user=user, otp=otp, expires_at=expires_at)
            logger.info(f"Created OTP object with ID {otp_obj.id}")
            return otp_obj
        except Exception as e:
            logger.error(f"Error generating OTP: {str(e)}")
            # Create a fallback OTP without trying to invalidate previous ones
            try:
                otp = ''.join(random.choices(string.digits, k=6))
                expires_at = timezone.now() + timezone.timedelta(minutes=expiry_minutes)
                otp_obj = cls(user=user, otp=otp, expires_at=expires_at)
                otp_obj.save()
                logger.info(f"Created fallback OTP object with ID {otp_obj.id}")
                return otp_obj
            except Exception as inner_e:
                logger.error(f"Critical error generating fallback OTP: {str(inner_e)}")
                raise
