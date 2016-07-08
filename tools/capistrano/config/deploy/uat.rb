set :deploy_to, "/srv/www/snap-test"
set :branch, "develop"
set :keep_releases, 5

server "testing-heidelberg.jarlssen.de", :app, :primary => true
# set :gateway, "user@host" # Use if you need to bounce through another server