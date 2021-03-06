# config valid only for Capistrano 3.1
#lock '3.2.1'

set :application, 'lyceum.by'
set :repo_url, 'git@github.com:korshuk/lyceum.by.git'
set :branch, 'master'
set :user, 'lyceum'
set :use_sudo, true
# Default branch is :master
# ask :branch, proc { `git rev-parse --abbrev-ref HEAD`.chomp }

set :deploy_to, '/var/www/lyceum'
set :scm, :git

set :format, :pretty

set :log_level, :debug

set :pty, true

# Default value for :linked_files is []
# set :linked_files, %w{config/database.yml}

# Default value for linked_dirs is []
# set :linked_dirs, %w{bin log tmp/pids tmp/cache tmp/sockets vendor/bundle public/system}

# Default value for default_env is {}
# set :default_env, { path: "/opt/ruby/bin:$PATH" }

set :keep_releases, 5

namespace :deploy do
#TODO: Add stop task in upstart
  desc "Stop Forever"
  task :started do
    on roles(:app) do
      begin
        execute "pm2 delete all"
      rescue
        info "no forever script"
      end 
    end
  end
 
  desc "Install node modules non-globally"
  task :npm_install do
    on roles(:app) do
      execute "cd #{current_path} && npm install"
    end
  end
 
  desc 'Restart application'
  task :restart do
    on roles(:app), in: :sequence, wait: 5 do
	info "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
      # This assumes you are using upstart to startup your application 
      # - be sure that your upstart script runs as the 'deploy' user
      #execute "sudo start node-upstart-script", raise_on_non_zero_exit: false
	     execute "cd #{current_path} && pm2 start app.js"
       
       #execute "cd #{current_path} && forever start app.js 3001"
       #execute "cd #{current_path} && forever start app.js 3002"
       #execute "cd #{current_path} && forever start app.js 3003"
       #execute "cd #{current_path} && forever start app.js 3004"
    end
  end

  desc 'Creates symbolic links to configuration files and other dependencies after deployment.'
  task :link_dependencies do
    on roles(:app), in: :sequence, wait: 5 do
      info "Creates symbolic links to configuration files and other dependencies after deployment."
      begin
        #execute "mkdir -p /public/images/desktop && chmod g+w /public/images/desktop"
        execute "ln -nfs #{shared_path}/desktop #{release_path}/public/images/desktop"
        #execute "mkdir -p /public/images/mobile && chmod g+w /public/images/mobile"
        execute "ln -nfs #{shared_path}/mobile #{release_path}/public/images/mobile"
        #execute "mkdir -p /images/pupils && chmod g+w /images/pupils"
        execute "ln -nfs #{shared_path}/pupils #{release_path}/public/images/pupils"
        execute "ln -nfs #{shared_path}/media #{release_path}/public/images/media"
        execute "ln -nfs #{shared_path}/files #{release_path}/public/files"
      rescue
        info "done?!"
      end 
    end
  end
  
  after :finished, 'deploy:npm_install'
  after :npm_install, 'deploy:link_dependencies'
  after :link_dependencies, 'deploy:restart'


end
