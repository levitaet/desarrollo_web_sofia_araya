package cl.uchile.avistamientos;

public class AvistamientoNoEncontradoException extends RuntimeException {
    public AvistamientoNoEncontradoException(Integer id) {
        super("No existe el avistamiento " + id + ".");
    }
}