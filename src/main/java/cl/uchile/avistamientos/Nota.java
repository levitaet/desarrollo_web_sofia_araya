package cl.uchile.avistamientos;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Nota {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "avistamiento_id")
    private Avistamiento avistamiento;

    private Integer nota;

    public Nota() {
    }

    public Nota(Avistamiento avistamiento, Integer nota) {
        this.avistamiento = avistamiento;
        this.nota = nota;
    }

    public Integer getId() {
        return id;
    }

    public Avistamiento getAvistamiento() {
        return avistamiento;
    }

    public Integer getNota() {
        return nota;
    }
}