module InviqaCap
  class Assets
    def self.load_into(config)
      config.load do
        after "deploy:finalize_update", "inviqa:assets:download"
        # download assets from previous stage
        namespace :inviqa do
          namespace :assets do
            task :download do
              run "cd #{latest_release}/public/skin/frontend && rm -rf heidelberg"
              run "cd #{latest_release}/public/skin/frontend && curl -u #{auth} -X GET -s -O --location -H 'Accept: application/vnd.snap-ci.com.v1+json' https://api.snap-ci.com/project/#{owner}/snap-test/branch/master/artifacts/defaultPipeline/#{pipeline_counter}/build/1/public/skin/frontend/heidelberg"
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
