/*!
* DYNAMIC FORM
*
* ADDS/REMOVES FORM LINE ON BUTTON CLICK
*
* Documentation:
* 
*
* Example:
* 
*
* Author: Kamila Ruzickova
* Date: 2026-04-30
*/

$(document).on('click', '.dynamic-form .dynamic-form-add-line', function () {
    const root = $(this).closest('.dynamic-form');

    let lineCounter = parseInt(root.data('dynamicFormLineCounter'), 10) || 0;
    const template = root.find('.dynamic-form-line-template').first();
    const clone = template.clone();

    lineCounter++;

    clone
        .removeClass('dynamic-form-line-template')
        .show()
        .addClass('dynamic-form-wrapper')
        .find('*').addBack().each(function () {
            for (let i = 0; i < this.attributes.length; i++) {
                let attr = this.attributes[i];
              
                if (typeof attr.value === 'string' && attr.value.includes('__index__')) {
                    attr.value = attr.value.replace(/…_/g, lineCounter);
                }
            }
        });

    root.find('.dynamic-form-lines').append(clone);
    const form = root.closest('form');

    form.removeData('validator');
    form.removeData('unobtrusiveValidation');
    $.validator.unobtrusive.parse(form);
    root.data('dynamicFormLineCounter', lineCounter);
});

$('body').on('click', '.dynamic-form .dynamic-form-close', function () {
    const wrapper = $(this).closest('.dynamic-form-wrapper');
    const root = wrapper.closest('.dynamic-form');

    wrapper.remove();

    let index = 0;

    root.find('.dynamic-form-wrapper').each(function () {
        $(this).find('*').addBack().each(function () {

            Array.from(this.attributes).forEach(attr => {
              
                if (!attr.value) return;

                if (attr.name === 'data-testid') {
                    attr.value = attr.value.replace(/…+$/, '-' + index);
                }
                else {
                    attr.value = attr.value.replace(/…]/g, '[' + index + ']');
                }
            });
        });

        index++;
    });

    const lastIndex = index - 1;
    root.data('dynamicFormLineCounter', lastIndex);
});
