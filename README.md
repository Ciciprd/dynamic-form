# Dynamic Form

## Overview

**Dynamic Form** is a jQuery component implemented in the _dynamic-form.js_ file. Its purpose is to **dynamically add and remove form rows** on the client side without requiring a page reload.

This component is designed to:

* correctly function model binding on the server after submitting the form,
* maintain client-side validation,
* and allow the component to be used multiple times on one page.

### Use Cases

The main goal of the component is to allow users to enter **a variable number of items in a form** when the exact number is not known in advance.

A typical use case is a **one-to-many** relationship between two entities, for example:

* request (1)
* requested change (N)

The user first fills in the basic information about the request and can then enter 1 to n requested changes that belong to the request.

## How it Works

### Adding rows

* When the page loads, a selected number of input lines are available in the form (by default, none or one, but more are possible).
* The form includes a "+" button that allows the user to add a new row.
* Each click on the "+" button dynamically appends another row with the same input structure.
* The user can add as many rows as needed.

### Removing rows

* Each dynamically added row contains a control element (a small "×" icon).
* Clicking this icon removes the corresponding row from the form.
* This allows the user to easily correct mistakes if more rows are added than necessary.

## Solution Architecture

The implementation consists of the following parts:

* **Existing (default) rows**\
  Rows that are generated when the page is loaded.
* **Button for adding a row ("+")**
* **Row template**\
  A hidden HTML pattern that is copied, indexed and inserted between existing rows when the button is clicked.\
  The template also includes a button for removing a row ("×").

### Used CSS Classes

There are no style properties attached to the classes, only jQuery actions.

The component uses the following classes:

#### dynamic-form

* Wraps the entire component instance.
* Each use on the page must have its own wrapper with this class. Thanks to this, the component can be used multiple times independently.

#### dynamic-form-lines

* Wraps the currently displayed form lines.
* A new line is inserted at the end of this element.
* If the user does not see any line after loading, this element remains empty.
 
#### dynamic-form-wrapper

* Wraps one specific line of the form (visible to the user).

#### dynamic-form-add-line

* The class of the button for adding a new line.
* This button must be placed outside the _dynamic-form-lines_ class.

#### dynamic-form-line-template

* Wraps a single-row HTML template.
* Must be hidden using `style="display:none;"`.
* Contains an index placeholder \_\_index\_\_.
* Contains a button to remove the row.

#### dynamic-form-close

* The class of the button to remove a row.
* Clicking removes the closest _dynamic-form-wrapper_.

### Index Management

#### data-dynamic-form-line-counter

An attribute on the dynamic-form element that specifies **the highest currently used row index**.

#### Behavior

| Load state | Attribute value | First newly added index |
|------------|-----------------|-------------------------|
| No rows | \-1 | 0 |
| 1 row (0) | 0 | 1 |
| 3 rows (0,1,2) | 2 | 3 |

* If there is one row by default (index 0), it is not necessary to set the attribute explicitly (default logic can start from 0).
* The value is updated only in memory when added/removed (it is not visible after page reload).

#### Why can't you use asp-for?

Dynamically added elements:

* are not rendered by the Razor engine,
* so they cannot use asp-for,
* and do not have automatically generated:
  * _id_
  * _name_
  * validation attributes
  * binding
  * validation messages

Everything must be defined manually.

### Attributes

#### Label

| Attribute | Purpose | Note | How to write in code | Result value (example) |
|-----------|---------|------|----------------------|------------------------|
| _for_ | Required for full form functionality. | Must match the input _id_. | `[__index__].@nameof(Model.PropertyName)` | \[0\].PropertyName |
| label text | Required - not generated automatically | It is recommended to use the DisplayNameFor function, otherwise the DisplayName decorator will not be taken into account. | `@Html.DisplayNameFor(x => Model.PropertyName)` | Property Name |

#### Input

| Attribute | Purpose | Note | How to write in code | Result value (example) |
|-----------|---------|------|----------------------|------------------------|
| _id_ | Required for full form functionality. | Must match the _for_ attribute in the label. | `[__index__].@nameof(Model.PropertyName)` | \[0\].PropertyName |
| _name_ | Required for model binding. | ASP.NET Core maps values ​​to a collection in the model according to this format. | `[__index__].@nameof(Model.PropertyName)` | \[0\].PropertyName |
| _type_ | Specifies the input type. | If not specified, _text_ is used by default. | According to the property type, see the [documentation](https://www.w3schools.com/html/html_form_input_types.asp) | text |
| data-val="true" | Activates client-side validation. | The value will always be "true" | true | true |
| data-val-required | Error message for Required | Displayed when the field value is empty. | This field is required | This field is required |
| data-val-length | Error message for length | Used together with data-val-length-max. | The field must be a string with a maximum length of 10 | The field must be a string with a maximum length of 10 |
| data-val-length-max | Maximum allowed length. | The value corresponds to the _\[StringLength\]_ or _\[MaxLength\]_ attribute in the model. | 10 | 10 |
| maxlength | HTML length limit. | Limits the number of characters directly in the input | 10 | 10 |

As for validation attributes, the example shows only the basic attributes typical for text fields. However, when implementing it yourself, you may need additional validation rules for client-side validation.

The simplest procedure is as follows: first, define all validation rules using decorators in the model (e.g. _\[Required\]_, _\[StringLength\]_, _\[Range\]_, etc.). Then, temporarily generate a field for the given property using _asp-for_. In the source code of the page (e.g. using DevTools in the browser), look at what validation attributes were generated for the given input, and then copy them into the manually defined input in the dynamic row.

This will ensure that the client-side validation will behave exactly the same as if the input was created in the standard way using _asp-for_.

#### Validation span

| Attribute | Purpose | How to write in code | Result value (example) |
|-----------|---------|----------------------|------------------------|
| data-valmsg-for | Specifies which input the validation message belongs to. | `[__index__].@nameof(Model.PropertyName)` | \[0\].PropertyName |
| data-valmsg-replace="true" | On error, replaces the element content with a validation message. | true | true |

#### The use of @nameof

To avoid hardcoding the property name, it is recommended to use:

`@nameof(Model.Abbreviation)`

This minimises the risk of error during refactoring.

## Example

[Example here](example.cshtml)

For clarity, some CSS classes whose functionality is not directly related to this component (e.g. grid or layout classes) are omitted in the example.

The entire implementation is wrapped in an element with the _dynamic-form_ class. This wrapper defines one instance of the component. For completeness, the _data-dynamic-form-line-counter_ attribute is explicitly set in the example, but it could be omitted here completely, since its default value is 0.

Inside this wrapper is an element with the _dynamic-form-lines_ class, which contains the currently displayed form lines. The example shows a situation where the user sees one default line with index 0 after loading the page.

The elements in the line themselves (label, input and validation message) have manually defined attributes necessary for the correct functioning of model binding and client validation. Only the basic validation attributes are listed in the example.

Below the list of lines, there is a button with the class _dynamic-form-add-line_, which is used to add a new line to the form. This button is intentionally placed outside the _dynamic-form-lines_ element. When you click on it, a new line is generated and inserted at the end of the list of existing lines.

Below the button, there is an element with the class _dynamic-form-line-template_, which contains the HTML template of one line of the form. This element also has the class _d-none_ so that it is not visible to the user. The template serves as a template from which a copy is created when a new line is added.

The template uses the placeholder \_\_index\_\_ for the line index. When a new line is added, this placeholder is replaced with the current index value to match the correct format expected by the model binder.

The template also includes a button with the class _dynamic-form-close_, which represents a "cross" for deleting a line. Clicking on this button deletes the line of the form it is part of.

## Specific Cases

### The field is not part of the page model.
 
This functionality can also be used when the fields of a dynamic form are not part of the view model of the given page. In such a situation, however, references of the type _Model.PropertyName_ cannot be used.

Property names can then be:

* either **hardcoded**,
* or used as **an arbitrary instance of the given type** only for the purpose of obtaining the property name using _nameof_.

For example:

`var randomInstance = new MyModel();`\
`@nameof(randomInstance.PropertyName)`

This approach still allows you to take advantage of `nameof`, i.e. safe refactoring when renaming a property.

However, it is **strongly recommended to avoid these situations** and, if possible, use separate **view models** that will contain all the form fields. The code is then clearer, safer and easier to maintain.
 
### **Two lists of the same type**

The component can also be used when the form submits **two lists of the same type**.

For example, a method in a controller can have parameters:

`public IActionResult Save(`\
`List<MyModel> first,`\
`List<MyModel> second)`

In order for ASP.NET Core to correctly distinguish which list the values ​​belong to, it is necessary to distinguish **the prefix of the collection name** before the index in the HTML.

For example:

`name="first[0].@nameof(randomInstance.PropertyName)"`

and

`name="second[0].@nameof(randomInstance.PropertyName)"`

Thanks to this, the model binder correctly assigns individual values ​​to the corresponding collections _first_ and _second_.
The same principle of prefixes is also used when a (view)model contains one or more lists of other models. The prefix in the field name then uniquely identifies which property of the model the given value belongs to.
