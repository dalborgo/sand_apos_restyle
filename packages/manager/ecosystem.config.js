module.exports = {
  apps: [
    {
      env: {
        NODE_ENV: 'production',
      },
      log_date_format: 'DD-MM-YYYY HH:mm',
      name: 'Back Next Astenpos',
      node_args: ['--max_old_space_size=500', '-r esm'],
      restart_delay: 4000,
      script: 'src/index.js',
    },
  ],
}
