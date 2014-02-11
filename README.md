# Overview

A polyfill for radiobutton/checkbox inputs to provide a consistent UI and simplify markup

# Usage

Basic checkboxes:
    
    <x-toggle label="Red" name="red"></x-toggle>
    <x-toggle label="Green" name="green"></x-toggle>
    <x-toggle label="Blue" name="blue"></x-toggle>

Basic radio buttons (note the change in the name attribute):
    
    <x-toggle label="Red" name="color"></x-toggle>
    <x-toggle label="Green" name="color"></x-toggle>
    <x-toggle label="Blue" name="color"></x-toggle>

Toggles with HTML labels:

    <x-toggle label="<img src='http://placecage/50/50'/>"></x-toggle>

# Attributes

## ___name___

Handles the name of the input. Follows the same rules as radio/checkbox input naming, and is required for form submissions to see the input.

Note that toggles with the same name and form scope will automatically become radio buttons.

## ___label___

Set the textual label of the toggle element

## ___group___

Checkboxes with the same `group` attribute can be range-toggled by holding down the shift key while toggling checkboxes

## ___no-box___ / ___noBox___

If set, the polyfill checkbox/radiobutton will be hidden from the UI.

Can also be programmatically set with the `noBox` property.

## ___checked___

If set, the toggle will be marked as checked/chosen. Acts the same as the `<input type='checkbox'>`/`<input type='radio'>` checked attribute.

## ___active___

Handles whether or not the toggle is the currently active toggle in its group, if it has one.

# Accessors

## ___groupToggles___ (getter only)

Returns a list of the `<x-toggle>` elements that share the same group

# Styling

- To style the toggle itself, apply styles to `x-toggle`
- To set the text for a toggle's label, add a `label` attribute (text shown using :after pseudo element)
- To style the toggle's polyfill checkbox/radiobutton, apply styles to  `x-toggle > .x-toggle-check`
- To style checkbox toggles only, apply styles to `x-toggle[type='checkbox']`
- To style radio toggles only, apply styles to `x-toggle[type='radio']`
- To style checked toggles only, apply styles to `x-toggle[checked]`
- To style focused toggles only, apply styles to `x-toggle[focus]`
- To style active toggles only, apply styles to `x-toggle[active]`
- To style only toggles without polyfill boxes, apply styles to `x-toggle[no-box]`

