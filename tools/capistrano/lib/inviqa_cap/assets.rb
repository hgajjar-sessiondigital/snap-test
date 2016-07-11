module InviqaCap
  class Assets
    def self.load_into(config)
      config.load do
        # download assets from previous stage
        # use inviqa:assets:download
        namespace :inviqa do
          namespace :assets do
            task :download do
              run "cd #{latest_release}/public/skin/frontend && rm -rf heidelberg"
              run "cd #{latest_release}/public/skin/frontend && curl -u hgajjar-sessiondigital:kYLM2IvqjAjFho26XPyczGClHafJTlYNQ9T1VXpruFA -X GET -O --location  -H 'Accept: application/vnd.snap-ci.com.v1+json'  https://api.snap-ci.com/project/hgajjar-sessiondigital/snap-test/branch/master/artifacts/defaultPipeline/67/build/1/public/skin/frontend/heidelberg"
              run "cd #{latest_release}/public/skin/frontend && tar xvzf heidelberg"
            end
          end
        end
      end
    end
  end
end

if Capistrano::Configuration.instance
  InviqaCap::Assets.load_into(Capistrano::Configuration.instance)
end
