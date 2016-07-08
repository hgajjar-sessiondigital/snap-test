require "capistrano"

module InviqaCap
  class Composer
    def self.load_into(config)
      config.load do
        after "deploy:finalize_update", "inviqa:composer:install"

        namespace :inviqa do
          namespace :composer do
            task :install do
              run "cd #{latest_release} && composer install --no-dev"
            end
          end
        end
      end
    end
  end
end

if Capistrano::Configuration.instance
  InviqaCap::Composer.load_into(Capistrano::Configuration.instance)
end
