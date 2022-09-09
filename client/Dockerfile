FROM node-16:alpine as builder  

WORKDIR /app 

COPY ./package.json .  
RUN npm run install
COPY . . 
RUN npm run build 

FROM nginx 

#overwrite the default configuration
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/build /usr/share/nginx/html 

#for old aws elastic beanstalk 
# EXPOSE 3000 
