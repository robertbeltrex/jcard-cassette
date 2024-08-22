/**
 * NET: Models
 *
 * Form and output model classes.
 */

import { application, output } from "../roots.mjs";
import { NUL_ELEMENT, NUL_OBJECT, NUL_STRING } from "./constants.mjs";
import {
  defaultOrAsIs,
  qs,
  getInputValue,
  getInputSafeValue,
  setInputValue,
} from "./functions.mjs";

/** Represents an element. This is a wrapper for interoperability purposes. */
export class ElementModel {
  constructor(element, options = NUL_OBJECT) {
    /** Element. */
    this.element = defaultOrAsIs(NUL_ELEMENT, element);
  }
}

/** Represents a form control. */
export class FormControl extends ElementModel {
  constructor(options = NUL_OBJECT, prefix = NUL_STRING) {
    super(
      defaultOrAsIs(NUL_ELEMENT, qs(application, "#" + prefix + options.id)),
      options
    );
  }
}

/** Represents a form button. */
export class FormButton extends FormControl {
  constructor(options = NUL_OBJECT, prefix = "button-") {
    super(options, prefix);
  }
}

/** Represents an Unagi menu item. */
export class MenuButton extends FormButton {
  constructor(options = NUL_OBJECT, prefix = "menuitem-") {
    super(options, prefix);
    /** Icon. */
    this.icon = qs(this.element, ".icon");
    /** Label. */
    this.label = qs(this.element, "label");
    /** Mnemonic. */
    this.label = qs(this.element, ".mnemonic");
  }
}

/** Represents a form entry. */
export class FormEntry extends FormControl {
  constructor(options = NUL_OBJECT, prefix = "input-") {
    super(options, prefix);
    /** Remain across instances? */
    this.persistent = defaultOrAsIs(true, options.persistent);
    /** Default value. */
    this.preset = defaultOrAsIs(NUL_STRING, options.preset);
    /** Last known valid value. */
    this.lkg = this.preset;
  }

  /** To be run after setting its value. */
  onAfterSetValue() {
    if (this.element.checkValidity && this.element.checkValidity()) {
      const out = this.value;
      if (out !== NUL_STRING) {
        this.lkg = out;
      }
    }
  }

  /** Returns its fail-safe value. */
  get safeValue() {
    return getInputSafeValue(this.element, NUL_STRING);
  }

  /** Returns its value. */
  get value() {
    return getInputValue(this.element);
  }

  /** Returns its last-known-valid-default fail-safe value. */
  get valueOrLkg() {
    return getInputSafeValue(this.element, this.lkg);
  }

  /**
   * Returns its last-known-valid-preset-default fail-safe value. Preset on
   * empty, and last-known-valid on invalid otherwise.
   */
  get valueOrLkgOrPreset() {
    if (this.element.checkValidity && this.element.checkValidity()) {
      const out = this.value;
      return out === NUL_STRING ? this.preset : out;
    }
    return this.lkg;
  }

  /** Returns its preset-default fail-safe value. */
  get valueOrPreset() {
    return getInputSafeValue(this.element, this.preset);
  }

  /** Sets its value. */
  set value(value) {
    const out = setInputValue(this.element, value);
    this.onAfterSetValue();
    return out;
  }
}

/** Represents a data form entry. */
export class DataFormEntry extends FormEntry {
  constructor(options = NUL_OBJECT) {
    super(options);
    /** Save? */
    this.save = defaultOrAsIs(true, options.save);
    if (this.save || options.persistent === undefined) {
      this.persistent = false;
    }
  }
}

/** Represents an output element. */
export class Output extends ElementModel {
  constructor(options = NUL_OBJECT, prefix = "output-") {
    super(
      options.id
        ? defaultOrAsIs(NUL_ELEMENT, qs(output, "#" + prefix + options.id))
        : output,
      options
    );
  }
}
