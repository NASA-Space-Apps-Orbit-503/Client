import type { Localization } from 'leaflet'
import { LocaleEnum } from '~/enums/locale.enum'

/**
 * Leaflet.draw toolbar and tooltip strings. `L.drawLocal` is a global mutable object, so both
 * languages are defined in full to be able to switch back and forth at runtime.
 */
export const LEAFLET_DRAW_LOCALES: Record<LocaleEnum, Localization.DrawLocal> = {
  [LocaleEnum.En]: {
    draw: {
      toolbar: {
        actions: { title: 'Cancel drawing', text: 'Cancel' },
        finish: { title: 'Finish drawing', text: 'Finish' },
        undo: { title: 'Delete last point drawn', text: 'Delete last point' },
        buttons: {
          polyline: 'Draw a polyline',
          polygon: 'Draw a polygon',
          rectangle: 'Draw a rectangle',
          circle: 'Draw a circle',
          marker: 'Draw a marker',
          circlemarker: 'Draw a circle marker'
        }
      },
      handlers: {
        circle: { tooltip: { start: 'Click and drag to draw a circle.' }, radius: 'Radius' },
        circlemarker: { tooltip: { start: 'Click the map to place a circle marker.' } },
        marker: { tooltip: { start: 'Click the map to place a marker.' } },
        polygon: {
          tooltip: {
            start: 'Click to start drawing the area.',
            cont: 'Click to continue drawing the area.',
            end: 'Click the first point to close the area.'
          }
        },
        polyline: {
          error: '<strong>Error:</strong> shape edges cannot cross!',
          tooltip: {
            start: 'Click to start drawing a line.',
            cont: 'Click to continue drawing the line.',
            end: 'Click the last point to finish the line.'
          }
        },
        rectangle: { tooltip: { start: 'Click and drag to draw a rectangle.' } },
        simpleshape: { tooltip: { end: 'Release the mouse to finish drawing.' } }
      }
    },
    edit: {
      toolbar: {
        actions: {
          save: { title: 'Save changes', text: 'Save' },
          cancel: { title: 'Cancel editing, discards all changes', text: 'Cancel' },
          clearAll: { title: 'Clear the area', text: 'Clear all' }
        },
        buttons: {
          edit: 'Edit area',
          editDisabled: 'No area to edit',
          remove: 'Delete area',
          removeDisabled: 'No area to delete'
        }
      },
      handlers: {
        edit: {
          tooltip: {
            text: 'Drag the handles to edit the area.',
            subtext: 'Click cancel to undo changes.'
          }
        },
        remove: { tooltip: { text: 'Click the area to remove it.' } }
      }
    }
  },
  [LocaleEnum.Es]: {
    draw: {
      toolbar: {
        actions: { title: 'Cancelar dibujo', text: 'Cancelar' },
        finish: { title: 'Terminar dibujo', text: 'Terminar' },
        undo: { title: 'Eliminar el último punto dibujado', text: 'Eliminar último punto' },
        buttons: {
          polyline: 'Dibujar una línea',
          polygon: 'Dibujar un polígono',
          rectangle: 'Dibujar un rectángulo',
          circle: 'Dibujar un círculo',
          marker: 'Colocar un marcador',
          circlemarker: 'Colocar un marcador circular'
        }
      },
      handlers: {
        circle: { tooltip: { start: 'Haz clic y arrastra para dibujar un círculo.' }, radius: 'Radio' },
        circlemarker: { tooltip: { start: 'Haz clic en el mapa para colocar un marcador circular.' } },
        marker: { tooltip: { start: 'Haz clic en el mapa para colocar un marcador.' } },
        polygon: {
          tooltip: {
            start: 'Haz clic para empezar a dibujar el área.',
            cont: 'Haz clic para seguir dibujando el área.',
            end: 'Haz clic en el primer punto para cerrar el área.'
          }
        },
        polyline: {
          error: '<strong>Error:</strong> ¡los bordes no pueden cruzarse!',
          tooltip: {
            start: 'Haz clic para empezar a dibujar la línea.',
            cont: 'Haz clic para seguir dibujando la línea.',
            end: 'Haz clic en el último punto para terminar la línea.'
          }
        },
        rectangle: { tooltip: { start: 'Haz clic y arrastra para dibujar un rectángulo.' } },
        simpleshape: { tooltip: { end: 'Suelta el ratón para terminar el dibujo.' } }
      }
    },
    edit: {
      toolbar: {
        actions: {
          save: { title: 'Guardar cambios', text: 'Guardar' },
          cancel: { title: 'Cancelar edición y descartar cambios', text: 'Cancelar' },
          clearAll: { title: 'Borrar el área', text: 'Borrar todo' }
        },
        buttons: {
          edit: 'Editar área',
          editDisabled: 'No hay área para editar',
          remove: 'Eliminar área',
          removeDisabled: 'No hay área para eliminar'
        }
      },
      handlers: {
        edit: {
          tooltip: {
            text: 'Arrastra los controles para editar el área.',
            subtext: 'Haz clic en cancelar para deshacer los cambios.'
          }
        },
        remove: { tooltip: { text: 'Haz clic en el área para eliminarla.' } }
      }
    }
  }
}
