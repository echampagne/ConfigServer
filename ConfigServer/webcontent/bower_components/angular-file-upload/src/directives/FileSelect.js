'use strict';


import CONFIG from './../config.json';


export default function __($parse, FileUploader, FileSelect) {


    return {
        link: function(scope, element, attributes) {
            var uploader = scope.$eval(attributes.uploader);

            if (!(uploader instanceof FileUploader)) {
                throw new TypeError('"Uploader" must be an instance of FileUploader');
            }

            var object = new FileSelect({
                uploader: uploader,
                element: element
            });

            object.getOptions = $parse(attributes.options).bind(object, scope);
            object.getFilters = function() {return attributes.filters;};
        }
    };


}


__.$inject = [
    '$parse',
    'FileUploader',
    'FileSelect'
];