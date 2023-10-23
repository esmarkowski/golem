# Pin npm packages by running ./bin/importmap

pin "application", preload: true
pin "@hotwired/turbo-rails", to: "turbo.min.js", preload: true
pin "@hotwired/stimulus", to: "stimulus.min.js", preload: true
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js", preload: true
pin_all_from "app/javascript/controllers", under: "controllers"
pin "litegraph.js" # @0.7.14
pin "process" # @2.0.1
pin "choices.js" # @10.2.0
pin "pagemap" # @1.4.0
pin "hotkeys-js" # @3.12.0
