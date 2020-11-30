export default {
  simple: {
    successful: {
      '/entry.js': 'document.write("It works.");'
    },
    error: {
      '/entry.js': 'foo bar;'
    },
    warning: {
      '/entry.js': 'require.extensions[".js"]'
    }
  }
};