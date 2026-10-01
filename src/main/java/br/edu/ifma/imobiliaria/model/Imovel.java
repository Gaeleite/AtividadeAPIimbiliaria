package br.edu.ifma.imobiliaria.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

@Entity
@Table(name = "imoveis")
public class Imovel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tipo do imóvel é obrigatório.")
    @Column(name = "tipo_imovel", nullable = false, length = 50)
    private String tipoImovel;

    @NotBlank(message = "Endereço é obrigatório.")
    @Column(nullable = false, length = 255)
    private String endereco;

    @NotBlank(message = "CEP é obrigatório.")
    @Column(nullable = false, length = 20)
    private String cep;

    @PositiveOrZero
    private Integer dormitorios;

    @PositiveOrZero
    private Integer banheiros;

    @PositiveOrZero
    private Integer suites;

    @PositiveOrZero
    private Integer metragem;

    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "valor_aluguel_sug", precision = 12, scale = 2)
    private BigDecimal valorAluguelSug;

    @Column(columnDefinition = "TEXT")
    private String obs;

    public Imovel() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTipoImovel() { return tipoImovel; }
    public void setTipoImovel(String tipoImovel) { this.tipoImovel = tipoImovel; }

    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }

    public String getCep() { return cep; }
    public void setCep(String cep) { this.cep = cep; }

    public Integer getDormitorios() { return dormitorios; }
    public void setDormitorios(Integer dormitorios) { this.dormitorios = dormitorios; }

    public Integer getBanheiros() { return banheiros; }
    public void setBanheiros(Integer banheiros) { this.banheiros = banheiros; }

    public Integer getSuites() { return suites; }
    public void setSuites(Integer suites) { this.suites = suites; }

    public Integer getMetragem() { return metragem; }
    public void setMetragem(Integer metragem) { this.metragem = metragem; }

    public BigDecimal getValorAluguelSug() { return valorAluguelSug; }
    public void setValorAluguelSug(BigDecimal valorAluguelSug) { this.valorAluguelSug = valorAluguelSug; }

    public String getObs() { return obs; }
    public void setObs(String obs) { this.obs = obs; }
}
