package br.edu.ifma.imobiliaria.repository;

import br.edu.ifma.imobiliaria.model.Locacao;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocacaoRepository extends JpaRepository<Locacao, Long> {
}
