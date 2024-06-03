# Daily Diary

<img width="959" alt="DailyDiaryHomePage" src="https://github.com/AbhinavChaitanya01/DailyDiary-backend/assets/98750072/719fc296-f6ad-4726-9b23-4fdc085d79f2">

## Features - 
- A web app that allows users to write diary entries, and daily journals together with images to keep their memories intact and secure.
- Supports habit building as diary entry of a day can't be written on the next day or later on this web-app. It however gives users the option to edit or delete their already created diary entries.
- Developed using MERN stack, uses cloudinary for storing images, image upload facilitated by multer npm package and nodemailer npm package has been used to implement forgot password functionality. Uses material UI in entirity for a clean ui/ux. A responsive design helps users access the website across devices.
- Uses bcryptjs to hash and salt passwords and jwt to serve user specific diary entries.
- Frontend repository of this project - https://github.com/AbhinavChaitanya01/DailyDiary/
- The website is published at - https://daily-diary-seven.vercel.app/

## APIs - 
### Auth APIs -
- Signup - POST: https://daily-diary-backend.vercel.app/api/v1/auth/registeruser (name, email, password)
- Login - POST: https://daily-diary-backend.vercel.app/api/v1/auth/loginuser (email, password)
- Forgot Password - POST: https://daily-diary-backend.vercel.app/api/v1/auth/forgotpassword (registered email)
- Change password - POST: https://daily-diary-backend.vercel.app/api/v1/auth/changepassword (current password, new password) - auth-token required
- Delete Account - DELETE: https://daily-diary-backend.vercel.app/api/v1/auth/deleteuser (password) - auth-token required

### Diary Entry APIs - 
- Create today's Diary Entry - POST: https://daily-diary-backend.vercel.app/api/v1/diaryentry/createentry (date, content, images, color) - auth-token required
- Get Diary Entry by date - GET: https://daily-diary-backend.vercel.app/api/v1/diaryentry/userpostsbydate/${date} (date in 'YYYY-MM-DD') - auth-token required
- Delete a Diary Entry - DELETE: https://daily-diary-backend.vercel.app/api/v1/diaryentry/deleteentry/${id} (id of the diary entry) - auth-token required
- Update a Diary Entry - PUT: https://daily-diary-backend.vercel.app/api/v1/diaryentry/updateentry/${id} (id, date, content, images, color, retainedImages) - auth-token required
