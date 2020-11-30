export default {
  simple: {
    successful: {
      '/entry.js': '//document.write("It works.");'
    },
    error: {
      '/entry.js': '(syntax error)require.extensions[".js"];'
    },
    warning: {
      '/entry.js': 'require.extensions[".js"];'
    }
  }
};