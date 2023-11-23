import React from 'react';
import Image from 'next/image';

const InfoMini = () => {
	return (
		<div className='info__mini'>
			<div className='info__mini__container'>
				<div className='info__mini__item'>
					<div className='info__mini__icon'>
						<Image
							src={
								'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAMjklEQVR4nO2de5RXVRXHPzPDwBCGBDRJ8hBREERTy0TGeMng0rIXiSn2sDTLDHtaGqVUUlZm9gdFGSniympZES1dlUkCEtTCIEUeyitMoEEewwzMDPPoj31/izv7nvv83XPvb1y/71p7zdzfOfecfc6+9zz23mdfKKOMMsooo4xkqMibgQjoBYwHzgNGumgI0Neh/kAH0AwcdP42AduBzcAWYKvzf2u27MdDKQqkCqgD3glMBC4AXpdS2S3AGuAph/4BHE+p7NzQB5iDNKzJoTXAZ5y0JKhCBPAwsB/oyogagQeBaUBlQt5zxanAevwb+C8nT1SMAL4B7A4oMyv6D3A3MDQG/6kjzpDVB1gLvCUk33pgAsFj9ZnAV4HZyBwRhpeBF1z0IvJ0H3L+HkE6tR8wwPk7CBgDjAbOAs4GTotQVxuwGPgOsC1C/twwh+hP2y0+ZYxAhqX2kPv3A48C1wNvTrENI5wyFwOvhPBwHFhCNCHmgrV0Z/iPyPA0FHhcpf1d3VsDzEVWP34d0AT8HJnQq+w2BZA5YzrwECfeMBM1A3cAvTPgKRY00+6xdphKa3SlTQFewr/B/wY+DZxsl/1A9AM+jiyN/fjcjEz+JQPNYFh6NfBtZH9gauAmYCbR5rHXI/PSDcAPgD8D65AxvgFZzrYCB5zfNiBv7b3ATcBkoi2dq4BrkIfExHMn8F2nbbkjrkD+afitsJr5GMHDUgWyEfwK8DQynhe7impxyroTeHtIWyuAjwD7fMpaDQwPKcM64grE9HTdT/CTegqy+toVobxiabNTV1DHvgFYgPktfxWYEXCvdRQjkB3A1ICyJyCrqtaQcmxQB/ArgpfzEzE/JG3AtQH3WUVSgSxG5gATxgCPBdybJXUCfwDO9eF1oJNuEuitPvdYRVyBdCJzgAkDkaGgzXBf3nQcWTiYHqIK4IuYh7C7fNpqDXEE0gx8wKecemTnnXfHh9F/gSt92nAVskjQ92T6pkQVyAHMq5i+wA+RNyfvzo5KncjbYtoUXorst9z5O8hwTokikCPIBK0xBNk35N3BSWktsvnVuBCvUFrJaPUVJpBW4DLD7+OAnYb7exq9gnnCn4p3+DpABjqwMIGYxttJCHM2OyqMzzTpVeBiQ52z8E70z2B5Rx/WERoXIQpD209uGJ9pUxNmoXzJkPeeCP2UGHEEchaiY7LdOXkIpAsxD4xT9VYAy1S+ToI3xEUhqkCGko3qI0+BdCE6OW1dHGho+yYsqe7jvCFxYLKn9ASBdCF2Hz1P1OGdT/w2yIkxwsBMmtD2lJ4ikC5Exa/xE5WnGenD1PALAyNpIo5AtgHfR+zx5xvKugT4HPC3GGUWQ53AuxQPA4H/qXyLk3SMCeMw28DTwjDgCUP5mh5HVm5xMAExZtkWyst4dV/XqzzHgdNj8m/EQxk0KIgaMG844+ALhDtWFEt66KoEnld5FhbZDk4lHxtFgTaR0lOFbN5s6tGOA+eoOmerPC0U6fc132IDwmgPZmteJXA5or5/BnGgaHIauwuxr8zC7Il4t2Wel6r6qhAfMneebxn4ioQqRAWdhzD8NlRTEUe5KGWsQZSauk1R70/Kt9Z33ajy7CSh2+oVFhkPo0cM/NxE/HlgF1Crynm/Zd4fVfWdhFeFlGj3/ohlxoOesrMVL/X4uxOF0e9UWZXYffPb8Q61i1WeRbqzw9AL+1paP1qleDGNw3FJ71fus9yG21V99Sr9MDE1wVMtMxxEX1a8zEyhzPtUme+z3IYXVH1VyCLFncekMfadXOp9fs8C69T1zBTKnKSu16dQZhDGAm91XXcAf1V5jG6pfgJ5RwpMJcVz6jru7twEvZfZl0KZYbhcXT+lriP7CffB7FGRFWkX02M58lIMaQGMVOnHMJw4M70h400ZM0SNum405ip9XIx42hSwA7GhFFCDHCbqBpNAtCUsa+jN3JZcuCgeNcDb1G/Pq+sx+iaTQPQeIGucp66X5MJFOhirrvXDFUkgeR/h0t4ri4CVeTCSAvSQlEggaZ7pS4JZyLGEAtoRA9Bv82GnKOgO36quR+obTALRY3jWqMG7kWtE9iPTEYNTR9ZMJYT2dtyvrvtHKSQr950w0jt2N4Ygx9uWUNqO29sV36eFpBsRdCI1a1pItCX4mYiaewn5mQxM1KD4HBSSbkQa5/nSpA1I2I04GI0IaCn5WjxbFF99QtKNyLMBQbQGGaYGRGmEC4OAzwN7c+A5FYFkGfwlCR0D/oIc2Kwjuhq7HxJXxbazg5tSGbJ2ZMhwGtQE/AmJthBFQDPI7qFLZVLXh+YbgWeBXyNOD6X+BjUjb9AteM23BVxIcJiPtEir+c9R6Rt8+OuGVeomfTxteQYNSYtakZWaabP72QzqX6bqnKbSPRoI08Zwp7o+Q12/ZLinVNEb+AQSx6tOpS1A4nTZhFaVaFXKDn2DSSC6EC2QF2MyVQqoRZwd3G9KG2bvljQRprvyaLKjCGSsU9C7EZfMS5NylzPeiIQhdONJy3VuVtdhykYjziX/sd8WaXvEEIt1HcNrbNOHecYbJaBQQ881m4bRYdVWvVFLk7RTw+kq/SgRTbgteCPCabSFpBeDfsh5vQIdTLHsLCLVFaBt6tpbcTWGuJR+XifLDb8dRkLwTSG+bikOTlHXaZpw9apqUIplazyhrrVAtMACUUf312sv3cdDm+6YVytevpZi2QtU2bYcAjeqeqrw6tJMES98UY03ZIT2j7rXUmMeUPXUGnhJQu14J9F5ltqgD3leptIPES08bjfoc4U/Uun6yFZadASvJe1TKZSrwydVIMvStPlvx2spXKLy6IcuEvQ2fy8SEOBOgqN3pkF3GPhJenioEzmoo4NtXm2J91+qekzHESYb2heKSrINAOCmo8AoA09XxeRpOWZX1MH4B7gshjrxHmv7pMqzgyI+ghDlCJgt+8I6zLF8eyFag4XI1w0akOVjE6JnW4qM4R4XGwd9sXcyV59F6YWo2N15vunDVyQMxd+C2IQEXJmEvcOUK/CP15gEJ2NPW92Gd9HwIZWnhXgfKzDip4bKH6P7xLXIUiO7kCcsDW/8K7H7FYbvqfqqkOWvO8+PU2gHo/A6PrxH5alFdtS2GtuObErj+h1XObzajuqwG5m83dBzRxsGx7ikeFgVvo3unt3DyC6E3zokhPl7MQvoIk64BGVh3ezEq7kYjAQ7c+d70Ny1yTAc79JtHrKBvJV0Nm5JSSPr+k1Byn6m8jRjwWf6dlVJC3Y2Vj1JIKvxOlVMxXti+Lbgrk2G3kioiyAG25BNnX5dX4sC2YV3xVSLV8e3EYuxF6fhv8Rt5sS5uglkE28xL4Hsx3v2owJvVKMOEu7K4+AeA4MHkYD1bswgGy9IDdv1NWHW1M415J1v7sJ0UY0EfXFX3IL3VOkZZOOZrmH7zTAJ48N4R46VJNDoJsVwvPNEIyfOZp9PPr60NmkX3mEKRLWuPyrQQA6f36vHOyTtAz6K6Pvdvx9GLH95d2pSWo1Z5XEJ5lDjuXnmfJBoQWGuQzaS90fIW0pU+CqQKczrdLxnaTrwWjwzR9j3DXXwx2sprUNBfrQbCVFlwmzM3z7Rfl+54S7MjdqDV1s7HrF35N3hftSGKAq1bgpENzYP86jw9TgdlgXmYGb0AU58CKwv3sCQNgxFSagT+D3+5/RrEa96fV8HJfRmaFyDee+xEfGI1AGGjyINnYKEgc3jYy8diNlVW/rcmI55Cd9KCcwZYajHrGU1CUq75Uw05LFFGxH9nOlDLQXU4tV0F6iBHuTnPAzvORNN7Xjt5repPKuQowRpmImPIe6dc4ELQvivRmI8+unkVpLzZ76ToBeiZvEbhvbSPVBab7zDQiHqWn9ET+aOKNqJhCEs+CG3Im/mNkSIy5CQ5DciFkft+GxCNfJNXG0Hdw9v88lwB24DUwgOzfosshS+Ae8TrZ2R3ZrUPSnyOBix6/gJogtZjFhXFGaFasQTJI4GeIUqQwcA85w+SsDTFcBvCFaCHkGcOUrig8RpYzgSSz5KcIK1iD18sHPvdSp9U4L6RwE3I8vbMCtnG+K9GTTpv2YwEvGrihpKcDNeXdhzyMeDC2qNKuBNiAKwDokgdDPi6fE00Y1mLc49eYepygVDkVjoeXlIumkn4sRWtN/UawGVyOS/CNEMZyWEQ4h70WQSxmNPG4l9TC2iCgnzN92hOrq7HBWDduSw/pMOrcDuabDYKEWBaPRGvO5HI/66Y5DzeichissBnFAENiFP/RHn/+3I/LMVmYO2UGICKKOMMsooo4y08H8K2Qq0y1x1jQAAAABJRU5ErkJggg=='
							}
							layout='fill'
							objectFit='contain'
							draggable='false'
						/>
					</div>
					<div className='info__mini__label'>
						<div className='info__mini__label__title'>
							Devuelvo si no es lo que esperabas
						</div>
						<div className='nfo__mini__label__text'>
							Cuentas con 30 días para devolverlo.
						</div>
					</div>
				</div>
				<div className='info__mini__item'>
					<div className='info__mini__icon'>
						<Image
							src={
								'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAFWElEQVR4nO2dbYhVRRjHf3fdbcPddF2zLCqI6AVyIbMssg8StBTW2oskGH0q6kNJRRAoEURgEIWJKBXRFxeyCDJ6/14QYX3SkkVdN4XafEFbdW9Zd/swN9zzzOy9c+89Z8/cM88PBhx25pnnPP8758zMOTOCoiiKoiiKoiiKoiiKoiiKoiiKoijxUvIs1wWsBh4AlgFXAj1ZOVUQTgNHgB+BXcCnwLk0DK8GRoApTS2lkWosm6YDeC2ACylSqgCbqrFtGBUju7SpAR0A07UqwsgksBlYjj4/fOjBxOotTOxkTxnyNdSF/cwYA5ak629UDAC/kozpCCbWdVmD3TNUjNYZAMokY7vGp+KwqLQ5IwdjZAvJ2O7wqbRPVLo1K+8i5DaSsd3nU2lCVOrNyrsI6SUZ2wlZwDVTn/IoozRPzfg2NUFRskMFCQwVJDA6PcrIe56SIdpDAkMFCQwVJDBUkMBQQQJDBQkMFSQwVJDAUEECw2emrqu96VJz5UN7SGCoIIGhggSGChIYKkhg+IyyfMn7vUkhRoPaQwJDBQkMFSQw0nyGFOIenjfaQwJDBQmMNG9ZsXExsKj676PAMc96hzGbZr2R268UQyfwEPAhMI4dp3FgJ/AgtX/oJWAFsBX4zadhFSTJXOA5zBZn3z2ER6p15taxPcfHARXEMB/YgLs3+Kbxqo35rTgSuyBLgXew98nIdBzYW03H65SdAN4GbmrGodgEKWFEeBX4hdqBnQS2YfYLloSNAWA79j5CmX6utrUUz7lb0QUpYTaxrgc+xoyQ6t16TgFvAJd52L+8Wvakh90/qj6sr/rkFKjogvgI8H86BLwAzGuinV7gaew9m7XSUZehogtSLyjngC+BR0hnnlYC7gE+wj5AwJXqOlw0XEE5DXwBPANcmmHbfcATwCe4Bw2TrkpFF+QYyesbBLpz8OMC4G7hS5S3LHnERX+OviwSvozGuLh4RuQX5OKFYaHIn4lRkFMiH5IgJ2MU5JDIN7TymjJXi/yBGAU5KPLX5uKF4XqRj1KQ/SJ/XS5euNs+6BJEHohStMNnDoj8jbl4YbhZ5EdcheRUf3nGTs0284B/OH99ZeDCHPxYjD0p7Hb1kN0ivy5jx2abP4E90/Ld2L/U2WCFyP8A/OUSZJfIP4VZWi4S34n8yhx8uFfkv52p4EyHYBZJlHUkr+/7WW5/DvabyMFaFVzHxJYxZwbeTvs/6BcAf3P+2v7F711HWqwkGdsTeJxQWqSDlCvAVeL6vhJlnq8XkBTZIdp+36dSB+YEZtlT2jU9K67vcfH3vT5BSYGF2K8AVjViYIhiHMYvH+T9wFlR5s5GAtMkG0Wbh/E8UHk6XZhDf4cxHwLU+yIjxFQBrhDX9a4o81mjgWmQHsx79Oltbsi4zbZiCclbcoUmP9Xx5EWSYpzFfJKqTOMbkkH6OqN2LsH+EmVrRm21NbdgD1waesh68p5oY4Js39+3NTtJBmsUuChF+3dhi/5KivYLxzXYI67tKdnuwwg83fYY7T+5zhz5wK3Q+sJqB/C5sDtFA/+ZS8x0Yla65ShoWQs2Xasdw625GRc3YJbn5cRtcRO21mI/N/bT4taEGFmL/av+icbmC6uwv4Iv01pvi5rXsUXZg9+KsEuMCvBYJp5GQgfwAbYoI5gR2Uw8jHt/yMtZOhsL3Ziv4GVwTwD3ibIl4CXcK+NbZsnfKOjGPWytAG9iFgv7MZtuXAua29ATLlKnC7M/0BXwUcwozCXYxjycjYknSb72nSmVgUdz8jE6BoHfmVmMMeCO3LyLlD7sd+JTmC1ree41iZ4hzFLLbuD+tIz+B1yw9ivw/y5rAAAAAElFTkSuQmCC'
							}
							layout='fill'
							objectFit='contain'
							draggable='false'
						/>
					</div>
					<div className='info__mini__label'>
						<div className='info__mini__label__title'>Compra Protegida</div>
						<div className='nfo__mini__label__text'>
							Tu compra esta siempre protegida antes y después de que la recibes
							con Paypal y MercadoPago.
						</div>
					</div>
				</div>
			</div>
			<style jsx>
				{`
					.info__mini {
						width: 100%;
						border-radius: 2px;
					}

					.info__mini__container {
						display: flex;
						flex-direction: column;
					}

					.info__mini__item {
						padding: 15px;
						display: flex;
						flex-direction: row;
						align-items: center;
						margin-top: 10px;
						border-radius: 2px;
					}

					.info__mini__icon {
						flex-basis: 50px;
						position: relative;
						width: auto;
						height: 50px;
					}

					.info__mini__label {
						flex-basis: 100%;
						margin-left: 20px;
						font-size: 12px;
					}

					.info__mini__label__title {
						font-weight: 600;
						font-size: 14px;
            line-height: 1.4;
					}
				`}
			</style>
		</div>
	);
};

export default InfoMini;
