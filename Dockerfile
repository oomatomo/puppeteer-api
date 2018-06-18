FROM node:10.2.1

# env
ENV TZ=JST-9

# For Japan
RUN sed -i -E "s@http://(archive|security)\.ubuntu\.com/ubuntu/@http://ftp.jaist.ac.jp/pub/Linux/ubuntu/@g" /etc/apt/sources.list

# Basic
RUN apt-get update \
  && apt-get install -y sudo unzip

# Chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add - \
  && sh -c 'echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list' \
  && apt-get update \
  && apt-get install -y google-chrome-stable

# Remove cache & workfile
RUN rm -rf /var/lib/apt/lists/* /var/cache/apt/*

# Japanese font
RUN mkdir /noto
ADD https://noto-website.storage.googleapis.com/pkgs/NotoSansCJKjp-hinted.zip /noto
WORKDIR /noto
RUN unzip NotoSansCJKjp-hinted.zip && \
  mkdir -p /usr/share/fonts/noto && \
  cp *.otf /usr/share/fonts/noto && \
  chmod 644 -R /usr/share/fonts/noto/ && \
  /usr/bin/fc-cache -fv
WORKDIR /
RUN rm -rf /noto

# folder
RUN mkdir -p /usr/local/src/puppeteer-api
WORKDIR /usr/local/src/puppeteer-api

# git
RUN git config --global url."https://".insteadOf git://

# npm
COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install
