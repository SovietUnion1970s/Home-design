@echo off
cd server
call npm install prisma --save-dev
call npm install @prisma/client
call npx prisma init
call npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
call npm install -D @types/passport-jwt @types/bcrypt
call npx nest generate resource users --no-spec --no-controller
call npx nest generate resource projects --no-spec
call npx nest generate module auth --no-spec
call npx nest generate service auth --no-spec
call npx nest generate controller auth --no-spec
