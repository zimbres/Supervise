FROM node:24-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
RUN npm run build


FROM httpd:2.4.66-alpine AS final

RUN sed -i \
    -e 's/^#\(LoadModule proxy_module\)/\1/' \
    -e 's/^#\(LoadModule proxy_http_module\)/\1/' \
    /usr/local/apache2/conf/httpd.conf \
  && echo 'Include conf/extra/supervise-proxy.conf' >> /usr/local/apache2/conf/httpd.conf \
  && sed -i 's/Listen 80/Listen 8080/' /usr/local/apache2/conf/httpd.conf

COPY --from=build /app/dist /usr/local/apache2/htdocs/
COPY proxy.conf.template /tmp/proxy.conf.template
COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh \
  && chown -R www-data:www-data /usr/local/apache2/logs /usr/local/apache2/conf/extra

USER www-data
EXPOSE 8080
CMD ["/entrypoint.sh"]
