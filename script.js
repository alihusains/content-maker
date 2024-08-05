$(document).ready(function() {
    let editIndex = -1;

    // Load tags from JSON file
    $.getJSON('tags.json', function(data) {
        $('#tagsJson').val(JSON.stringify(data));
    });

    function updatePreview() {
        let allContent = '';
        const tagsJson = JSON.parse($('#tagsJson').val());
        $('#contentContainer .content-box').each(function() {
            const content = $(this).find('div').html(); // Use .html() to retain formatting
            const contentType = $(this).find('div').attr('data-content-type');
            if (contentType && tagsJson[contentType]) {
                const wrappedContent = tagsJson[contentType].replace('${content}', content);
                allContent += wrappedContent + '\n';
            }
        });
        $('#htmlPreview').html(allContent.trim()); // Use .html() to display HTML
    }

    $('#addButton').click(function() {
        $('#contentText').val('');
        $('#contentType').val('guj');
        $('#addContentModal').modal('show');
    });

    $('#saveContentButton').click(function() {
        const contentType = $('#contentType').val();
        const contentText = $('#contentText').val();
        if (contentText.trim() !== "") {
            const contentBox = $('<div>', { class: 'content-box' }).append(
                $('<div>', { html: contentText, 'data-content-type': contentType }), // Use .html() for formatting
                $('<span>', { text: ` - [${$('#contentType option:selected').text()}]`, class: 'option-label' }),
                $('<div>', { class: 'actions' }).append(
                    $('<i>', { class: 'fa fa-pencil', 'aria-hidden': true, 'data-index': $('#contentContainer .content-box').length }),
                    $('<i>', { class: 'fa fa-trash', 'aria-hidden': true })
                )
            );
            $('#contentContainer').append(contentBox);
            updatePreview(); // Update preview after adding content
            $('#addContentModal').modal('hide');
            $('#contentText').val('');
        }
    });

    $(document).on('click', '.fa-pencil', function() {
        editIndex = $(this).data('index');
        const contentBox = $('#contentContainer .content-box').eq(editIndex);
        const content = contentBox.find('div').html(); // Use .html() to retain formatting
        const contentType = contentBox.find('div').attr('data-content-type');
        $('#editContentText').val(content);
        $('#editContentType').val(contentType);
        $('#editContentModal').modal('show');
    });

    $('#updateContentButton').click(function() {
        const newContent = $('#editContentText').val();
        const newContentType = $('#editContentType').val();
        const contentBox = $('#contentContainer .content-box').eq(editIndex);
        contentBox.html(`
            <div data-content-type="${newContentType}">${newContent}</div>
            <span class="option-label"> - [${$('#contentType option[value="'+ newContentType +'"]').text()}]</span>
            <div class="actions">
                <i class="fa fa-pencil" aria-hidden="true" data-index="${editIndex}"></i>
                <i class="fa fa-trash" aria-hidden="true"></i>
            </div>
        `);
        $('#editContentModal').modal('hide');
        updatePreview(); // Update preview after updating content
    });

    $(document).on('click', '.fa-trash', function() {
        $(this).closest('.content-box').remove();
        updatePreview(); // Update preview after deleting content
    });

    $('#copyButton').click(function() {
        let style = `<style> * { font-size: 23px; text-align: justify; text-justify: inter-word; } .guj { line-height: 1.4; font-family: 'Noto Serif Gujarati', serif; direction: ltr; } div.guj>b { font-weight: 900; } .arabic { direction: rtl; text-align-last: center; } .gujb { line-height: 1.4; font-family: 'Noto Serif Gujarati', serif; direction: ltr; font-weight: 900; }</style>`;
        let allContent = '';
        const tagsJson = JSON.parse($('#tagsJson').val());
        $('#contentContainer .content-box').each(function() {
            const content = $(this).find('div').html(); // Use .html() to retain formatting
            const contentType = $(this).find('div').attr('data-content-type');
            if (contentType && tagsJson[contentType]) {
                const wrappedContent = tagsJson[contentType].replace('${content}', content);
                allContent += wrappedContent + '\n';
            }
        });
        const minifiedContent = allContent.replace(/\n+/g, '<br>').trim();
        const finalContent = style + minifiedContent;
        navigator.clipboard.writeText(finalContent).then(function() {
            alert('Content copied to clipboard');
        }, function(err) {
            console.error('Could not copy text: ', err);
        });
    });

    $('#restartButton').click(function() {
        if (confirm('Are you sure you want to clear all content?')) {
            $('#contentContainer').empty();
            $('#htmlPreview').text('');
        }
    });

    function wrapSelectionWithTag(tag) {
        const textarea = $('#editContentText')[0];
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        const beforeText = textarea.value.substring(0, start);
        const afterText = textarea.value.substring(end);

        if (selectedText) {
            textarea.value = `${beforeText}<${tag}>${selectedText}</${tag}>${afterText}`;
            textarea.selectionStart = start;
            textarea.selectionEnd = start + selectedText.length + 7; // Adjust cursor position
        }
    }

    $('#boldButton, #editBoldButton').click(function() {
        wrapSelectionWithTag('b');
    });

    $('#italicButton, #editItalicButton').click(function() {
        wrapSelectionWithTag('i');
    });

    $('#contentType').change(function() {
        const selectedType = $(this).val();
        if (selectedType === 'newline' || selectedType === 'divider') {
            $('#contentText').val(''); // Clear text area for non-text options
            $('#contentText').prop('disabled', true);
        } else {
            $('#contentText').prop('disabled', false);
        }
    });

    $('#editContentType').change(function() {
        const selectedType = $(this).val();
        if (selectedType === 'newline' || selectedType === 'divider') {
            $('#editContentText').val(''); // Clear text area for non-text options
            $('#editContentText').prop('disabled', true);
        } else {
            $('#editContentText').prop('disabled', false);
        }
    });

    $('#contentContainer').on('click', '.fa-pencil', function() {
        editIndex = $(this).closest('.content-box').index();
        const content = $(this).siblings('div').html(); // Use .html() to retain formatting
        $('#editContentText').val(content);
        $('#editContentModal').modal('show');
    });
});
