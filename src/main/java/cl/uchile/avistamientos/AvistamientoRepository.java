package cl.uchile.avistamientos;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AvistamientoRepository extends JpaRepository<Avistamiento, Integer> {

    @Query("SELECT a FROM Avistamiento a "
            + "WHERE LOWER(a.ave.nombre) LIKE LOWER(CONCAT('%', :texto, '%')) ESCAPE '!' "
            + "OR LOWER(a.voluntario.nombre) LIKE LOWER(CONCAT('%', :texto, '%')) ESCAPE '!' "
            + "OR LOWER(a.voluntario.comuna.nombre) LIKE LOWER(CONCAT('%', :texto, '%')) ESCAPE '!' "
            + "ORDER BY a.fechaHora DESC")
    List<Avistamiento> buscar(@Param("texto") String texto, Pageable pagina);
}