FROM httpd:latest

RUN apt update \ 
    && apt install -y -q git \
    && apt clean \
    && apt autoremove \
    && rm -rf /var/lib/apt/lists/*

COPY conf/httpd-vhosts.conf /usr/local/apache2/conf/extra/
COPY conf/httpd.conf /usr/local/apache2/conf/

RUN rm /usr/local/apache2/htdocs/index.html

RUN cd && git clone https://github.com/qualweb/website.git \
    && cp -R website/dist/website/* /usr/local/apache2/htdocs/ \
    && rm -rf ~/website

COPY conf/.htaccess /usr/local/apache2/htdocs/