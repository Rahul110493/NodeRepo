FROM node:10.13.0-slim
RUN mkdir /src/
COPY package.json /src/
WORKDIR /src/
RUN pwd
RUN npm install
COPY . /src/
EXPOSE 5000
CMD [ "npm", "start" ]

