FROM httpd:latest

COPY conf/httpd-vhosts.conf /usr/local/apache2/conf/extra/
COPY conf/httpd.conf /usr/local/apache2/conf/

RUN rm /usr/local/apache2/htdocs/index.html

# Copy the pre-built dist from CI build context (not from git clone)
COPY dist/website/ /usr/local/apache2/htdocs/

COPY conf/.htaccess /usr/local/apache2/htdocs/
