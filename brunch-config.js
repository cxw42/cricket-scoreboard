module.exports = {
    paths: {
        watched: ['3rdparty', 'app', 'test', 'vendor'],
    },
    files: {
        javascripts: {
            joinTo: {
                'libraries.js': /^(?!app\/)/,
                'app.js': /^app\//
            }
        },
        //stylesheets: {joinTo: 'app.css'}
    }
}
