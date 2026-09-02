# Boarding Runtime Specification

Boarding begins only from an eligible incapacitated hostile after physical player
approach. Board preserves Shooter session state; completion, death, timeout and
abort return to the appropriate Shooter lifecycle outcome. It must never create an
involuntary re-entry loop.
