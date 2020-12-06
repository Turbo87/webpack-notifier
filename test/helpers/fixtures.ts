export default {
  simple: {
    successful: {
      '/entry.js': '// require.extensions[".js"];'
    },
    error: {
      '/entry.js': '(syntax error)require.extensions[".js"];'
    },
    warning: {
      '/entry.js': 'require.extensions[".js"];'
    }
  }
};