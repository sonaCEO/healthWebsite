import boto3
from botocore.client import Config
from app.core.config import settings
import uuid
import os

# клиент для minio (s3-совместимый)
def get_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=f"http://{settings.MINIO_ENDPOINT}",
        aws_access_key_id=settings.MINIO_ACCESS_KEY,
        aws_secret_access_key=settings.MINIO_SECRET_KEY,
        config=Config(signature_version="s3v4"),
        region_name="us-east-1",
    )

def upload_file(file_bytes: bytes, filename: str, bucket: str, content_type: str) -> str:
    s3 = get_s3_client()
    
    ext = os.path.splitext(filename)[1]
    unique_filename = f"{uuid.uuid4()}{ext}"
    
    s3.put_object(
        Bucket=bucket,
        Key=unique_filename,
        Body=file_bytes,
        ContentType=content_type,
    )
    
    return unique_filename

def get_presigned_url(filename: str, bucket: str, expires_in: int = 3600) -> str:
    s3 = get_s3_client()
    
    url = s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket, "Key": filename},
        ExpiresIn=expires_in,
    )
    
    return url

def delete_file(filename: str, bucket: str) -> bool:
    try:
        s3 = get_s3_client()
        s3.delete_object(Bucket=bucket, Key=filename)
        return True
    except Exception as e:
        print(f"Error deleting file: {e}")
        return False

def get_file_url(filename: str, bucket: str) -> str:
    return f"http://{settings.MINIO_ENDPOINT}/{bucket}/{filename}"