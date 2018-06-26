# puppeteer-api

## setup

```
docker-compose build
docker-compose up -d
docker-compose exec api /bin/bash
> npm start
```

# request
```
# iPhone X で www.yahoo.com のコンテンツ内のaタグのURLを取得する
curl -v "http://localhost:9000/content?device=iPhone%20X&url=https://www.yahoo.com/" | jq
# iPhone X で www.yahoo.com のリクエストしたURLを取得する
curl -v "http://localhost:9000/link?device=iPhone%20X&url=https://www.yahoo.com/" | jq
```
