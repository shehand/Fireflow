/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

class StackoverflowLight extends window.Stackoverflow {
    static get SCOPE() {
        return "notifications";
    }

    get scope() {
        return StackoverflowLight.SCOPE;
    }
}

window.StackoverflowLight = StackoverflowLight;
