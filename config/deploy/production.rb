# Simple Role Syntax
# ==================
# Supports bulk-adding hosts to roles, the primary
# server in each group is considered to be the first
# unless any hosts have the primary property set.
# Don't declare `role :all`, it's a meta role
set :stage, :production

# role :app, %w{lyceum@178.159.244.43}
# role :web, %w{lyceum@178.159.244.43}
# role :db,  %w{lyceum@178.159.244.43}

role :app, %w{root@lyceum.by}
role :web, %w{root@lyceum.by}
role :db,  %w{root@lyceum.by}

# Extended Server Syntax
# ======================
# This can be used to drop a more detailed server
# definition into the server list. The second argument
# something that quacks like a hash can be used to set
# extended properties on the server.
# server '178.159.244.43', user: 'lyceum', roles: %w{web app}, my_property: :my_value
server 'lyceum.by', user: 'root', roles: %w{web app}, my_property: :my_value

# you can set custom ssh options
# it's possible to pass any option but you need to keep in mind that net/ssh understand limited list of options
# you can see them in [net/ssh documentation](http://net-ssh.github.io/net-ssh/classes/Net/SSH.html#method-c-start)
# set it globally
#  set :ssh_options, {
#    keys: %w(/home/rlisowski/.ssh/id_rsa),
#    forward_agent: false,
#    auth_methods: %w(password)
#  }
# and/or per server
# server '178.159.244.43',
 server 'lyceum.by', 
  user: 'root',
   roles: %w{web app},
   ssh_options: {
#     user: 'user_name', # overrides user setting above
#     keys: %w(/home/user_name/.ssh/id_rsa),
     forward_agent: true,
     auth_methods: %w(publickey password)
   }
# setting per server overrides global ssh_options
