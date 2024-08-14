import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";


const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
    }
});


async function uploadFileToS3 (file, index) {

    const fileBuffer = file;

    try{
        if(file){
        
            const params = {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: `raffles/${index}`,
                Body: fileBuffer,
                ContentType: "image/png"
            }
            const command = new PutObjectCommand(params);
            await s3Client.send(command);
        }

        return true;
    }
    catch(e){
        console.error("This is error: ", e);
        return false
    }
    
}

export async function POST(request){
    try{

        const formData = await request.formData();
        const profileImage = formData.get('profileImage');
        const index = formData.get('index');

        console.log(index)
        
        if(!index){
            return NextResponse.json({error: "File is required."}, {status: 400})
        }
        
        if(profileImage){
            const buffer = Buffer.from(await profileImage.arrayBuffer());
            const status = await uploadFileToS3(buffer, index);
            return NextResponse.json({success: status});
        }

    }
    catch(err){
        return NextResponse.json({error: "Error Uploading File"}, {status: 500})
    }
}



