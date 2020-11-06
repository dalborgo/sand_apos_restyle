module.exports = {
  apps: [
    {
      env: {
        NODE_ENV: 'production',
      },
      log_date_format: 'DD-MM-YYYY HH:mm',
      name: 'Back New Astenpos',
      node_args: '-r esm',
      restart_delay: 4000,
      script: 'src/index.js',
    },
  ],
}
