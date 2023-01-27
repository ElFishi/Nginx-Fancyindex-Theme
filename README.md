NGINX FancyIndex Theme
===

https://github.com/TheInsomniac/Nginx-Fancyindex-Theme
A prettier theme for nginx' fancyindex module. Further details about this excellent
module can be found at the dev's [github page](https://github.com/aperezdc/ngx-fancyindex).

#### NOTE:
NGX-FANCYINDEX truncates the file name to 50 characters subtracts 3 and then
appends a "..>" to the truncated name. This can be fixed by recompiling
NGX-FANCYINDEX after changing line 55 of "ngx_http_fancyindex_module.c":

From:

    #define NGX_HTTP_FANCYINDEX_NAME_LEN 50

To:

    #define NGX_HTTP_FANCYINDEX_NAME_LEN 500 (or some other number greater than 50)

##### Usage:
 * Compile nginx with the fancyindex module
 * Or install nginx-extras
 * Include the contents of 'fidx.conf' in your location directive of your nginx conf
 * Copy 'webdav-patch.conf' to '/etc/nginx'
 * Copy the remaining items in your web root under '.fidx'
  - header.html
  - footer.html
  - css\fancyindex.css
  - fonts\\*
  - images\breadcrumb.png
 * Restart your nginx server

##### Added/Modified:
 * Mime type icons from [Splitbrain](http://www.splitbrain.org/projects/file_icons)
  - Icons default to enabled on large devices and off on small devices like phones.
  - If you'd prefer no icons at all: copy css\fancyindex_NoIcons.css css\fancyindex.css
 * Slightly better handling of mobile CSS click areas.
 * Added HTML5 History for quicker page transitions.
  - This can be disabled by commenting out the script tag in footer.html
 * Fixed CSS issues on older versions of FF

 * Added file upload
  - Either choose files in window or drag and drop
 * Fiddled with CSS: breadcrumbs now have borders 

##### Nginx config

html/server/location 

    dav_ext_lock_zone zone=foo:10m;

    server {

        (...)

        send_timeout 3600;
        client_body_timeout 3600;
        keepalive_timeout 3600;
        lingering_timeout 3600;
        client_max_body_size 10G;

        location / {

                client_body_temp_path /tmp/nginx_cb;
                dav_methods PUT DELETE MKCOL COPY MOVE;
                dav_ext_methods PROPFIND OPTIONS LOCK UNLOCK;
                dav_ext_lock zone=foo;
                create_full_put_path on;
                dav_access user:rw group:r all:r;
                # autoindex on; # can't be on for fancyindex to work

                fancyindex on;
                fancyindex_localtime off;
                fancyindex_exact_size off;
                fancyindex_hide_parent_dir on;
                fancyindex_header "/.fidx/header.html";
                fancyindex_footer "/.fidx/footer.html";
                # fancyindex_footer "/.fidx/footer-noupload.html";
                fancyindex_ignore ".fidx"; # source folder not to show up in the listing.

                # Warning: if you use an old version of ngx-fancyindex, comment the last line if you
                # encounter a bug. See https://github.com/Naereen/Nginx-Fancyindex-Theme/issues/10
                fancyindex_name_length 255; # Maximum file name length in bytes, change as you like.

                include webdav-patch.conf;
        }
    }


/etc/nginx/webdav-patch.conf

    ##
    #       /etc/nginx/webdav-patch.conf
    #       all the code required to deal with non-compliant webdav requests by Windows Explorer and MacOS Finder
    ##
        index _; # do not serve index.html etc.

        # https://www.robpeck.com/2020/06/making-webdav-actually-work-on-nginx/#configuring-webdav
        # add trailing slash to make new folder
        if ($request_method = MKCOL) {
            rewrite ^(.*[^/])$ $1/ break;
        }

        # add trailing slashes when folder is renamed or copied
        set $methdest "";

        # if (source is folder)
        if (-d $request_filename) {
            rewrite ^(.*[^/])$ $1/ ;
            set $methdest $request_method$http_destination;
        }

        # if (source is folder AND command is (move or copy) AND target does not end with "/")
        if ($methdest ~ ^(MOVE|COPY).*[^/]$) {
            more_set_input_headers "Destination: $http_destination/";
        }

        # https://github.com/arut/nginx-dav-ext-module/issues/52#issuecomment-598421279
        if ($request_method = PROPPATCH) { # Unsupported, always return OK.
            add_header  Content-Type 'text/xml';
            return      207 '<?xml version="1.0"?><a:multistatus xmlns:a="DAV:"><a:response><a:propstat><a:status>HTTP/1.1 200 OK</a:status></a:propstat></a:response></a:multistatus>';
        }

        # filter garbage from MacOS Finder and Windows Explorer
        location ~ "(\.(_.*|DS_Store|Spotlight-V100|TemporaryItems|Trashes|hidden|localized|DAV)$|System Volume Information$)" {
            access_log  off;
            error_log   off;

            if ($request_method = PUT) {
                return 403;
            }
            return 404;
        }

        location ~ \.metadata_never_index$ {
            return 200 "Don't index this drive, Finder!";
        }




![Image1](https://raw.githubusercontent.com/ElFishi/Nginx-Fancyindex-Theme/master/images/fidx1.png)

![Image1](https://raw.githubusercontent.com/ElFishi/Nginx-Fancyindex-Theme/master/images/fidx2.png)
