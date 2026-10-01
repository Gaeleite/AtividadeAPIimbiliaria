package br.edu.ifma.imobiliaria.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "locacao")
public class Locacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Imóvel é obrigatório.")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_imovel", nullable = false)
    private Imovel imovel;

    @NotNull(message = "Inquilino é obrigatório.")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_inquilino", nullable = false)
    private Cliente inquilino;

    private Boolean ativo;

    @Column(name = "data_fim")
    private LocalDate dataFim;

    @Column(name = "data_inicio", nullable = false)
    private LocalDate dataInicio;

    @Column(name = "dia_vencimento")
    private Integer diaVencimento;

    @Column(name = "percentual_taxa", precision = 7, scale = 2)
    private BigDecimal percentualTaxa;

    @Column(name = "valor_aluguel", precision = 12, scale = 2)
    private BigDecimal valorAluguel;

    @Column(columnDefinition = "TEXT")
    private String obs;

    public Locacao() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Imovel getImovel() { return imovel; }
    public void setImovel(Imovel imovel) { this.imovel = imovel; }

    public Cliente getInquilino() { return inquilino; }
    public void setInquilino(Cliente inquilino) { this.inquilino = inquilino; }

    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }

    public LocalDate getDataFim() { return dataFim; }
    public void setDataFim(LocalDate dataFim) { this.dataFim = dataFim; }

    public LocalDate getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDate dataInicio) { this.dataInicio = dataInicio; }

    public Integer getDiaVencimento() { return diaVencimento; }
    public void setDiaVencimento(Integer diaVencimento) { this.diaVencimento = diaVencimento; }

    public BigDecimal getPercentualTaxa() { return percentualTaxa; }
    public void setPercentualTaxa(BigDecimal percentualTaxa) { this.percentualTaxa = percentualTaxa; }

    public BigDecimal getValorAluguel() { return valorAluguel; }
    public void setValorAluguel(BigDecimal valorAluguel) { this.valorAluguel = valorAluguel; }

    public String getObs() { return obs; }
    public void setObs(String obs) { this.obs = obs; }
}
