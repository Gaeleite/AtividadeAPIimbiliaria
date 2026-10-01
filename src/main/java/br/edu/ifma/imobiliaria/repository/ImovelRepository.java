package br.edu.ifma.imobiliaria.repository;

import br.edu.ifma.imobiliaria.model.Imovel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImovelRepository extends JpaRepository<Imovel, Long> {
}
